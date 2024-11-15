import React from "react";
import { AntDesign } from "@expo/vector-icons";

type IconComponentProps = {
    color?: string;
    focused?: boolean;
};

export const icons = {
    index: (props: IconComponentProps) => <AntDesign name="home" size={26} {...props} />,
    create: (props: IconComponentProps) => <AntDesign name="pluscircleo" size={26} {...props} />,
    profile: (props: IconComponentProps) => <AntDesign name="user" size={26} {...props} />,
};
