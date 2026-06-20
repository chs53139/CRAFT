"use client";

import { useMemo } from "react";
import { ShareButton } from "@/components/ShareButton";
import {
  SharedInventionPayload,
  sharedPayloadToInvention,
} from "@/lib/invention-share";
import { buildInventionSharePayload } from "@/lib/share";

type Props = {
  invention: SharedInventionPayload;
  token: string;
};

export function CreationShareActions({ invention, token }: Props) {
  const payload = useMemo(() => {
    return buildInventionSharePayload(
      sharedPayloadToInvention(invention),
      `/share/creation/${token}`
    );
  }, [invention, token]);

  return <ShareButton payload={payload} compact className="h-11 w-11" />;
}
