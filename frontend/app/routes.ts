import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("views/layout.tsx", [
    index("views/index.tsx"),
    route("explore", "views/explore.tsx"),
    route("my-inventory", "views/my-inventory.tsx"),
    route("past-trades", "views/past-trades.tsx"),
  ]),
  route("sign-in", "views/sign-in.tsx")
] satisfies RouteConfig;
