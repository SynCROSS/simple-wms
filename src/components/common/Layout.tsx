import type { FC, PropsWithChildren } from "react";
import Header from "~/components/common/Header";
import SideNavigation from "~/components/common/SideNavigation";
import { Block } from "baseui/block";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Block maxHeight={"100vh"}>
      <Header />
      <Block
        display={"flex"}
        flexWrap
        justifyContent={"space-between"}
        alignItems={"flex-start"}
      >
        <SideNavigation />
        <Block
          width={"40em"}
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          margin={"auto"}
        >
          {children}
        </Block>
      </Block>
    </Block>
  );
};

export default Layout;
