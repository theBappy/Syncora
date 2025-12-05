import arcjet, { sensitiveInfo, slidingWindow } from "@/lib/arcjet";
import { base } from "../base";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

const buildStandardAj = () =>
  arcjet
    .withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: 180,
      })
    )
    .withRule(
      sensitiveInfo({
        mode: "LIVE",
        deny: ["PHONE_NUMBER", "CREDIT_CARD_NUMBER"],
      })
    );

export const standardReadSecurityMiddleware = base
  .$context<{
    request: Request;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decision = await buildStandardAj().protect(context.request, {
      userId: context.user.id,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: "Too many impactful changes, please slow down.",
        });
      }
      if (decision.reason.isSensitiveInfo()) {
        throw errors.BAD_REQUEST({
          message:
            "Sensitive information detected. Please remove PII (e.g. credit card data, phone number).",
        });
      }

      throw errors.FORBIDDEN({
        message: "Request blocked!",
      });
    }
    return next();
  });
