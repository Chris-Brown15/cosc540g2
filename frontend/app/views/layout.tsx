import { NavLink, Outlet } from "react-router";
import type { Route } from "../../types/frontend/app/views/+types/index";
import { IconBell, IconHeart, IconMessage } from "@tabler/icons-react";
import { startCase } from "lodash-es";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SwitchUp" },
    { name: "description", content: "A barting applciation" },
  ];
}

const tabs = ["explore", "my-inventory", "past-trades"];

const actions = [
  {
    id: "favorites",
    icon: IconHeart,
  },
  {
    id: "messages",
    icon: IconMessage,
  },
  {
    id: "notifications",
    icon: IconBell,
  },
];

export default function Layout() {
  return (
    <>
      <header className="header">
        <section className="header__section header__section--left">
          <NavLink className="header__logo" to="/">
            SwitchUp
          </NavLink>
          <nav className="navigation">
            <ul className="navigation__tabs">
              {tabs.map((tab) => (
                <li key={tab} className="navigation__tab">
                  <NavLink to={tab} className="navigation__tab-link">
                    {startCase(tab)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </section>
        <section className="header__section header__section--right">
          {actions.map(({ id, icon: Icon }) => (
            <button key={id} className="button--icon">
              <Icon strokeWidth={1.75} size={22} />
            </button>
          ))}
          <img className="avatar" src="/avatar.png" alt="user-avatar" />
        </section>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </>
  );
}
