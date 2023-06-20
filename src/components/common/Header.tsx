import { Button } from "baseui/button";
import { Layer } from "baseui/layer";
import { useStyletron } from "baseui";
import { signIn, signOut, useSession } from "next-auth/react";

import { AppNavBar, setItemActive } from "baseui/app-nav-bar";
import { ChevronDown, Delete, Overflow, Upload } from "baseui/icon";

const Header = () => {
  const { data: session } = useSession();
  const [css, theme] = useStyletron();

  return (
    <AppNavBar
      title="Simple Wms"
      userItems={[{ label: "logout" }]}
      mapItemToNode={() => (
        <div
          className={css({
            color: theme.colors.contentNegative,
            width: "100%",
          })}
          tabIndex={0}
          role="button"
          onClick={session ? () => void signOut() : () => void signIn()}
        >
          {session ? "로그아웃" : "로그인"}
        </div>
      )}
      username={session?.user.name ?? "yee"}
      usernameSubtitle={session?.user.email}
      userImgUrl={session?.user.image ?? ""}
    />
  );
};

export default Header;
