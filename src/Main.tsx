import React from "react";
import {
  Container,
  Checkbox,
  Header,
  Grid,
  Input,
  Button,
  GridRow,
  GridColumn,
} from "semantic-ui-react";

type P = {};
type S = {
  star_trek: boolean;
};

class Main extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {
      star_trek: false,
    };
  }

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
                {this.state.star_trek ? "Energise!" : "Render!"}
              </Button>
            </GridColumn>
          </GridRow>
          <GridRow>
            <Checkbox
              label="I'm a star trek fan"
              checked={this.state.star_trek}
              onChange={(e, data) => {
                if (data.checked !== undefined)
                  this.setState({ star_trek: data.checked });
              }}
            />
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
