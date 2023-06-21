import { Block } from "baseui/block";
import { signIn, useSession } from "next-auth/react";
import type { FC, PropsWithChildren } from "react";
import { Session } from "next-auth";
import { useStyletron } from "baseui";
import { HeadingXXLarge, ParagraphLarge } from "baseui/typography";
import { Button, KIND } from "baseui/button";
import { getBaseUrl } from "~/utils/api";
const RenderIfAuthenticated: FC<
  PropsWithChildren<{ session?: Session | null }>
> = ({ children }) => {
  const { data: session, status } = useSession();

  const [css, theme] = useStyletron();

  return (
    <>
      {status === "unauthenticated" && (
        <Block
          className={css({ inset: 0 })}
          position={"absolute"}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          backgroundColor={theme.colors.backgroundPrimary}
        >
          <HeadingXXLarge>⚠️ 인증이 필요합니다. ⚠️</HeadingXXLarge>
          <Button
            kind={KIND.tertiary}
            type="button"
            onClick={() =>
              void signIn(undefined, { callbackUrl: `${getBaseUrl()}/items` })
            }
          >
            인증하러 가기
          </Button>
        </Block>
      )}
      {session && children}
    </>
  );
};

export default RenderIfAuthenticated;
