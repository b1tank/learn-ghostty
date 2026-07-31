import DefaultTheme from "vitepress/theme";
import Dashboard from "../../components/Dashboard.vue";
import ProgressRing from "../../components/ProgressRing.vue";
import SourceLink from "../../components/SourceLink.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Dashboard", Dashboard);
    app.component("ProgressRing", ProgressRing);
    app.component("SourceLink", SourceLink);
  }
};
