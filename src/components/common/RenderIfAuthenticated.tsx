import { Block } from "baseui/block";
import { signIn, useSession } from "next-auth/react";
import type { FC, PropsWithChildren } from "react";
import { Session } from "next-auth";

const RenderIfAuthenticated: FC<
  PropsWithChildren<{ session?: Session | null }>
> = ({ children }) => {
  const { data: session, status } = useSession();

  return (
    <>
      {status === "unauthenticated" && (
        <Block
          position={"absolute"}
          top={0}
          left={0}
          right={0}
          bottom={0}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <p>⚠️ 인증이 필요합니다. ⚠️</p>
          <button type="button" onClick={() => void signIn()}>
            인증하러 가기
          </button>
        </Block>
      )}
      {session && children}
    </>
  );
};

export default RenderIfAuthenticated;
