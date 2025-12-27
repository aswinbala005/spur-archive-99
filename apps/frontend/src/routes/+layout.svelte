<script lang="ts">
import "../app.css";
// biome-ignore lint/correctness/noUnusedVariables: children is used in the template
const { children } = $props();
</script>

{@render children()}
