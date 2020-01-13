import React from 'react';
import { Container, Header, Grid, Input, Button, GridRow, GridColumn } from "semantic-ui-react";

class Main extends React.Component<{}, {pdf_base64?: string}> {

    state = {
        pdf_base64: undefined,
    }
    render() {
        const input_component =
            <Container>
                <Grid>
                    <GridRow>
                        <GridColumn width="4">
                            <Input placeholder="GitHub Repo" />
                        </GridColumn>
                        <GridColumn width="4">
                            <Input placeholder="Tex root file" />
                        </GridColumn>
                        <GridColumn width="4">
                        </GridColumn>
                        <GridColumn width="4">
                            <Button primary>Render!</Button>
                        </GridColumn>
                    </GridRow>
                </Grid>
            </Container>;
        const pdf_viewer = (this.state.pdf_base64) ? (<div />): (<div />);
        return (<Container>
            <Header size="large">Tex Renderer</Header>
            {input_component}
            {pdf_viewer}
        </Container>);
    }
}

export default Main;
