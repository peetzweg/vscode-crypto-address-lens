/* eslint-disable @typescript-eslint/naming-convention */
import * as https from "https";

import { defaultAbiCoder } from "@ethersproject/abi";

const FUNCTION_SELECTORS = {
  "symbol()": "0x95d89b41",
  "name()": "0x06fdde03",
  "decimals()": "0x313ce567",
};

type SolidityType = "string" | "uint";

export class RPCClient {
  private memory: Record<string, string | number | null | undefined> = {};

  constructor(public networkName: string, private rpcUrl: string) {}

  decimals = this.resolveOrFetchProperty(
    FUNCTION_SELECTORS["decimals()"],
    "uint"
  );
  name = this.resolveOrFetchProperty(FUNCTION_SELECTORS["name()"], "string");
  symbol = this.resolveOrFetchProperty(
    FUNCTION_SELECTORS["symbol()"],
    "string"
  );

  private resolveOrFetchProperty(selector: string, type: SolidityType) {
    return async (address: string) => {
      const memoryKey = address.toLowerCase() + "_" + selector;
      const memoryValue = this.memory[memoryKey];
      if (memoryValue !== undefined) {
        return memoryValue;
      }

      const value = await this.getSingleProperty<string>(
        address,
        selector,
        type
      );

      this.memory[memoryKey] = value;

      return value;
    };
  }

  private async getSingleProperty<T>(
    address: string,
    selector: string,
    type: "string" | "uint"
  ): Promise<T | null> {
    const payload = JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: address,
          data: selector,
        },
        "latest",
      ],
      id: 0,
    });

    try {
      const result = await this.post<string>(payload);

      return defaultAbiCoder.decode([type], result)[0];
    } catch {
      return null;
    }
  }

  private post<ResultType>(payload: string): Promise<ResultType> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        this.rpcUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": payload.length,
          },
        },
        (res) => {
          if (
            (res.statusCode && res.statusCode < 200) ||
            (res.statusCode && res.statusCode > 299)
          ) {
            return reject(new Error(`HTTP status code ${res.statusCode}`));
          }

          const body: Uint8Array[] = [];
          res.on("data", (chunk: any) => body.push(chunk));
          res.on("end", () => {
            const response = JSON.parse(Buffer.concat(body).toString());
            resolve(response["result"]);
          });
        }
      );

      req.on("error", (err: any) => {
        reject(err);
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request time out"));
      });

      req.write(payload);
      req.end();
    });
  }
}
