import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";
import HelpersContext from "./helpers/HelpersContext.jsx";

// Components
import { Nav } from "./Navigation/Nav.jsx";
import { SatellitesTable } from "./DataDisplays/SatellitesTable.jsx";
import { SchemasTable } from "./DataDisplays/SchemasTable.jsx";
import { Home } from "./Home.jsx";
import { About } from "./About.jsx";
import { Footer } from "./Navigation/Footer.jsx";
import { Register } from "./Accounts/Register";
import { Login } from "./Accounts/Login";
import { DropDown } from "./Accounts/DropDown";

// @material-ui
import { ThemeProvider } from "@material-ui/core/styles";
import { themes } from "./css/Themes.jsx"; 
import { CssBaseline, Container, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  content: {
    marginTop: 30,
  },
}));

export const App = () => {
  const [theme, setTheme] = useState(themes.dark);
  const [openAlert, setOpenAlert] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [alert, setAlert] = useState({
    title: "", //dialog title
    text: "", //dialog body text
    actions: "", //components for user input
    closeAction: "", //name of closing action button, e.g. "Cancel"
  });
  const [snack, setSnack] = useState(""); //snackbar body text

  const classes = useStyles();

  const toggleTheme = () => {
    setTheme((theme) => (theme === themes.dark ? themes.light : themes.dark));
  };

  return (
    <HelpersContext.Provider
      value={{
        snack,
        setSnack,
        alert,
        setAlert,
        openAlert,
        setOpenAlert,
        openSnack,
        setOpenSnack,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Nav theme={theme} toggleTheme={toggleTheme} />
          <Container maxWidth="lg" className={classes.content}>
            <Switch>
              <Route exact={true} path="/satellites">
                <SatellitesTable />
              </Route>
              <Route exact={true} path="/register">
                <Register />
              </Route>
              <Route exact={true} path="/login">
                <Login />
              </Route>
              <Route exact={true} path="/menu">
                <DropDown />
              </Route>
              <Route exact={true} path="/schemas">
                <SchemasTable />
              </Route>
              <Route exact={true} path="/about">
                <About />
              </Route>
              <Route exact={true} path="/">
                <Home />
              </Route>
              <Route path="*">
                <Home />
              </Route>
            </Switch>
          </Container>
        </Router>
          <Footer />
      </ThemeProvider>
    </HelpersContext.Provider>
  );
};
