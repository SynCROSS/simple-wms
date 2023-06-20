import { Navigation } from "baseui/side-navigation";
import { useRouter } from "next/router";
import { Block } from "baseui/block";
import SideNav from "baseui/side-navigation/nav";

const items = [
  { title: "홈", itemId: "/" },
  { title: "입고", itemId: "/inbound" },
  { title: "재고", itemId: "/items" },
  { title: "출고", itemId: "/outbound" },
];

const SideNavigation = () => {
  const router = useRouter();

  return (
    <Block width={"15em"}>
      <SideNav
        items={items}
        activeItemId={router.pathname}
        overrides={{
          Root: {
            style: ({ $theme }) => ({
              backgroundColor: $theme.colors.backgroundPrimary,
            }),
          },
        }}
        onChange={({ event, item }) => {
          event.preventDefault();
          if (item.itemId) {
            router.push(item.itemId);
          }
        }}
      />
    </Block>
  );
};

export default SideNavigation;
