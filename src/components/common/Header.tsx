import { useStyletron } from "baseui";
import { signIn, signOut, useSession } from "next-auth/react";

import { AppNavBar } from "baseui/app-nav-bar";

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
