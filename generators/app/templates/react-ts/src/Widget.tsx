import React, { useEffect, useState } from "react";
import styled from "styled-components";
import widgetSDK from "@happeo/widget-sdk";

import mockedWidgetApi from "@happeo/widget-sdk/dist/_mocked/api";
import widgetApi from "@happeo/widget-sdk/dist/api";

const { LinkExternal } = require("@happeouikit/form-elements");
const { margin200, padding300 } = require("@happeouikit/layout");
const { gray09 } = require("@happeouikit/colors");
const { TextDelta, BodyUI } = require("@happeouikit/typography");

interface IWidgetProps { 
  id: string;
  editMode: boolean;
}

const Widget = ({id, editMode}: IWidgetProps) => {
  const [ , setWidgetApi] = useState<mockedWidgetApi | widgetApi>();
  
  useEffect(() => {
    const doInit = async () => {
      // Init API
      const crntAPi = await widgetSDK.api.init(id);

      // Do stuff
      await crntAPi.getCurrentUser();
      console.log("I am all good and ready to go!");
      setWidgetApi(crntAPi);
    };
    
    doInit();
  }, [editMode, id]);

  return (
    <Container>
      <TextDelta style={{ marginBottom: margin200 }}>
        Happeo custom widget
      </TextDelta>
      <BodyUI>Useful resources</BodyUI>
      <StyledUl>
        <li>
          <BodyUI>
            <LinkExternal href="https://github.com/happeo/custom-widget-templates">
              Custom widget templates
            </LinkExternal>
          </BodyUI>
        </li>
        <li>
          <BodyUI>
            <LinkExternal href="https://github.com/happeo/widgets-sdk">
              Widget SDK
            </LinkExternal>
          </BodyUI>
        </li>
        <li>
          <BodyUI>
            <LinkExternal href="https://uikit.happeo.com/">
              Happeo UI kit
            </LinkExternal>
          </BodyUI>
        </li>
      </StyledUl>
    </Container>
  );
};

const Container = styled.div`
  padding: ${padding300};
  background-color: ${gray09};
`;
const StyledUl = styled.ul`
  list-style: disc;
  padding: ${padding300};
`;

export default Widget;
