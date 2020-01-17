import React from "react";
import {
  Container,
  Header,
  Grid,
  Input,
  Button,
  GridRow,
  GridColumn
} from "semantic-ui-react";

class Main extends React.Component {
  go() {}

  render() {
    const input_component = (
      <Container>
        <Grid>
          <GridRow>
            <GridColumn width="4">
              <Input placeholder="GitHub Repo" />
            </GridColumn>
            <GridColumn width="4">
              <Input placeholder="Tex root file" />
            </GridColumn>
            <GridColumn width="4"></GridColumn>
            <GridColumn width="4">
              <Button primary onClick={this.go}>
                Render!
              </Button>
            </GridColumn>
          </GridRow>
        </Grid>
      </Container>
    );
    return (
      <Container>
        <Header size="large">Tex Renderer</Header>
        {input_component}
      </Container>
    );
  }
}

export default Main;
