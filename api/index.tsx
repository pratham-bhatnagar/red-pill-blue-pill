import { Button, Frog, parseEther } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { handle } from "frog/vercel";
import { abi } from "../lib/abi.js";

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  browserLocation: "https://lazygames.ai/",
});

let contestId: string | null;

app.transaction("/vote", (c) => {
  const { buttonIndex } = c;
  let cid: number | bigint = contestId === null ? 1 : parseInt(contestId);
  cid = BigInt(cid);

  return c.contract({
    abi,
    chainId: "eip155:11155111",
    functionName: "vote",
    args: [cid, buttonIndex == 1 ? true : false],
    to: "0x5ad9C6E00CB9E9BB3845650D9f5eeb0224ab0943",
    value: parseEther("0.0001"),
    attribution: true,
  });
});

app.frame("/", (c) => {
  const { req } = c;
  const url = new URL(req.url); // Get the full URL from the request
  contestId = url.searchParams.get("contestid");

  return c.res({
    image: (
      <div
        style={{
          backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Red_and_blue_pill.jpg/2560px-Red_and_blue_pill.jpg")`,
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          Pick up one pill with 0.0001
        </div>
      </div>
    ),
    title: "RED PILL / BLUE PILL",
    intents: [
      <Button.Transaction target="/vote" action="/receipt">
        Red Pill
      </Button.Transaction>,
      <Button.Transaction target="/vote" action="/receipt">
        Blue Pill
      </Button.Transaction>,
    ],
  });
});

app.frame("/receipt", (c) => {
  const { transactionId } = c;
  const explorerUrl = `https://sepolia.etherscan.io/tx/${transactionId}`;
  return c.res({
    image: (
      <div
        style={{
          backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Red_and_blue_pill.jpg/2560px-Red_and_blue_pill.jpg")`,
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          Thanks for voting!
        </div>
      </div>
    ),
    intents: [<Button.Link href={explorerUrl}>View on Explorer</Button.Link>],
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
