import { BigNumber } from "ethers";

export const ETHER = BigNumber.from("1000000000000000000");
export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";
export const UINT256_MAX = BigNumber.from(2)
  .pow(BigNumber.from(256))
  .sub(BigNumber.from(1));

export const getRsv = (signature: string) => {
  let r: string;
  let s: string;
  let v: string;
  if (signature.startsWith("0x")) {
    r = signature.slice(0, 66);
    s = "0x" + signature.slice(66, 130);
    v = "0x" + signature.slice(130, 132);
  } else {
    r = "0x" + signature.slice(0, 64);
    s = "0x" + signature.slice(64, 128);
    v = "0x" + signature.slice(128, 130);
  }

  return { r, s, v };
};
