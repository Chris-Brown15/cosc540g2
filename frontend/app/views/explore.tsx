import { startCase } from "lodash-es";

// Fetch data in loader to pass to route view
export function loader() {
  return {
    trendingCategories: ["coffee", "beanie_babies", "macbooks", "fishing_rods"],
    marketItems: Array.from({ length: 24 }),
  };
}

export default function Explore({ loaderData }: any) {
  const { trendingCategories, marketItems } = loaderData;

  return (
    <>
      <section className="market-intro">
        <h2>Explore The Market</h2>
        <p>
          Search for items you know you want to trade—or discover ones you
          didn’t realize you needed.
        </p>
        <section className="market-search">
          <input
            className="market-search__input"
            placeholder="What are you looking to trade?"
          />
          <div className="market-categories">
            <h3 className="market-categories__title">Trending</h3>
            <ul className="market-categories__list">
              {trendingCategories.map((category: any) => (
                <li key={category} className="market-categories__item">
                  <button className="market-categories__button">
                    {startCase(category)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
      <section className="market-items">
        <div className="market-items__grid">
          {marketItems.map((_: any, index: number) => (
            <div key={index} className="market-items__item" />
          ))}
        </div>
      </section>
    </>
  );
}
