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
    chainId: "eip155:8453",
    functionName: "vote",
    args: [cid, buttonIndex == 1 ? true : false],
    to: "0x6893F4938BB984460fc6aBEf651be9FC71642587",
    value: parseEther("0.0001"),
    attribution: true,
  });
});

app.frame("/", (c) => {
  const { req } = c;
  const url = new URL(req.url);
  contestId = url.searchParams.get("contestid");

  return c.res({
    image: (
      <div
        style={{
          backgroundImage: `url("https://d1jnqnach91gxj.cloudfront.net/red_pill_blue_pill.jpeg")`,
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
            fontSize: 46,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 350,
            padding: "0 150px",
            whiteSpace: "pre-wrap",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 1)", 
          }}
        >
          Choose Red Pill or Blue Pill with 0.0001 ETH
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
  const explorerUrl = `https://basescan.org/tx/${transactionId}`;
  return c.res({
    image: (
      <div
        style={{
          backgroundImage: `url("https://d1jnqnach91gxj.cloudfront.net/red_pill_blue_pill.jpeg")`,
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
            fontSize: 50,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 50,
            padding: "0 150px",
            whiteSpace: "pre-wrap",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)", 
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
