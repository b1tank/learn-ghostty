import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import Dashboard from "../../components/Dashboard.vue";
import ProgressRing from "../../components/ProgressRing.vue";
import SourceLink from "../../components/SourceLink.vue";
import ThemeSelector from "../../components/ThemeSelector.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    "nav-bar-content-after": () => h(ThemeSelector, { placement: "bar" }),
    "nav-screen-content-after": () => h(ThemeSelector, { placement: "screen" })
  }),
  enhanceApp({ app }) {
    app.component("Dashboard", Dashboard);
    app.component("ProgressRing", ProgressRing);
    app.component("SourceLink", SourceLink);
  }
};
