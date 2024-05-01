import { Hono } from "hono";
import { solver, scoringRules } from "igc-xc-score";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

const fixesSchema = z
  .array(
    z.object({
      timestamp: z.union([z.string(), z.number()]),
      latitude: z.number(),
      longitude: z.number(),
      valid: z.boolean(),
    })
  )
  .min(8);

app.post("/", zValidator("json", fixesSchema), async (c) => {
  const fixes = await c.req.json();
  if (!fixes || fixes.length < 8) return c.json(undefined);
  console.log("Fixes:", fixes.length);

  try {
    // @ts-expect-error The provisioned data is sufficient for the solver
    const result = solver({ fixes: fixes }, scoringRules.XContest, {
      maxcycle: 2000, // max execution time per cycle in milliseconds
      noflight: true, // do not include the flight track in the geojson output
      invalid: true, // do not filter invalid GPS fixes
    }).next().value;
    if (result.optimal) {
      console.log("Result:", result?.scoreInfo?.distance);

      return c.json(result?.scoreInfo?.distance);
    }
  } catch (error) {
    console.log(error);
  }
  return c.json(undefined);
});

export default {
  port: 3030,
  fetch: app.fetch,
};
