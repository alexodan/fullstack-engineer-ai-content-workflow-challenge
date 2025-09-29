import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  route("/", "routes/_index.tsx", [
    index("routes/campaigns/_index.tsx"),
    route("campaigns/:id", "routes/campaigns/_index.$id.tsx"),
  ]),
] satisfies RouteConfig;
