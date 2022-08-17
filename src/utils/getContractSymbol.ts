const https = require("https");
import { defaultAbiCoder } from "@ethersproject/abi";

const MEMORY: Record<string, string | null | undefined> = {};
const FUNCTION_SIGNATURE = "0x95d89b41"; // symbol()

export async function getContractSymbol(address: string) {
  let memoryValue = MEMORY[address.toLocaleLowerCase()];
  if (typeof memoryValue === "string" || memoryValue === null) {
    return memoryValue;
  }

  const callObj = {
    to: address,
    data: FUNCTION_SIGNATURE,
  };

  const postData = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_call",
    params: [callObj, "latest"],
    id: 0,
  });

  const options = {
    hostname: "rpc.ankr.com",
    port: 443,
    path: "/eth",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": postData.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }

      const body: UInt8Array = [];
      res.on("data", (chunk: any) => body.push(chunk));
      res.on("end", () => {
        const response = JSON.parse(Buffer.concat(body).toString());

        let decodedName: string | null = null;
        try {
          decodedName = defaultAbiCoder.decode(
            ["string"],
            response["result"]
          )[0];
        } catch {
        } finally {
          MEMORY[address.toLocaleLowerCase()] = decodedName;
          resolve(decodedName);
        }
      });
    });

    req.on("error", (err: any) => {
      reject(err);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request time out"));
    });

    req.write(postData);
    req.end();
  });
}
