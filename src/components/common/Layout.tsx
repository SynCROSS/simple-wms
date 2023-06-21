import type { FC, PropsWithChildren } from "react";
import Header from "~/components/common/Header";
import SideNavigation from "~/components/common/SideNavigation";
import { Block } from "baseui/block";
import { useStyletron } from "baseui";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const [css, theme] = useStyletron();
  return (
    <Block height={"100vh"} display={"flex"} flexDirection={"column"}>
      <Header />
      <Block
        display={"flex"}
        flexWrap
        flex={"1 1 0"}
        // justifyContent={"space-between"}
        alignItems={"flex-start"}
      >
        <SideNavigation />
        <Block
          flex={1}
          height={"100%"}
          backgroundColor={theme.colors.backgroundPrimary}
        >
          {children}
        </Block>
      </Block>
    </Block>
  );
};

export default Layout;
