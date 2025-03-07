# Foldable card

This component is used to display a box that can be clicked to expand a hidden section with its contents.

The component's header contains two adjacent content areas that are set by the `header` and `summary` props (also see the `expandedSummary` prop); both are optional, but both areas take up space inside the card even if they are not set. To cause the `header` content area to take up the whole header card, set the `hideSummary` prop.

## Usage

```js
import FoldableCard from 'calypso/components/foldable-card';

function render() {
	return (
		<FoldableCard header="title" hideSummary>
			{ content }
		</FoldableCard>
	);
}
```

### Props

| Name                   | Type        | Default        | Description                                                                                                                                          |
| ---------------------- | ----------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `header`               | `string`    | null           | HTML or component to show in the default header view of the box.                                                                                     |
| `content`              | `string`    | null           | HTML or component to show in the expandable section of the box when it's expanded.                                                                   |
| `actionButton`         | `component` | null           | A component to substitute the regular expand button.                                                                                                 |
| `actionButtonExpanded` | `component` | null           | A component to substitute the regular expand button when the card is expanded. If not provided, we use `actionButton`.                               |
| `icon`                 | `string`    | `chevron-down` | Sets the Gridicon slug for the regular expand button. Retains the default value when the `actionButton` or `actionButtonExpanded` props are not set. |
| `cardKey`              | `string`    | ''             | A unique identifier for the card that can be used to help track its state outside the component (for example, to record which cards are open).       |
| `compact`              | `bool`      | false          | Indicates if the foldable card is compact.                                                                                                           |
| `disabled`             | `bool`      | false          | Indicates if the component is not interactive.                                                                                                       |
| `expandedSummary`      | `string`    | null           | A string or component to show next to the action button when expanded.                                                                               |
| `expanded`             | `bool`      | false          | Indicates whether the component should be expanded initially.                                                                                        |
| `onClick`              | `function`  | null           | Function to be executed in addition to the expand action when the header is clicked.                                                                 |
| `onClose`              | `function`  | null           | Function to be executed in addition to the expand action when the card is closed.                                                                    |
| `onOpen`               | `function`  | null           | Function to be executed in addition to the expand action when the card is opened.                                                                    |
| `summary`              | `string`    | null           | A string or component to show next to the action button when closed.                                                                                 |
| `hideSummary`          | `bool`      | false          | Indicates if the summary area should be hidden.                                                                                                      |
| `clickableHeader`      | `bool`      | false          | Indicates if the whole header can be clicked to open the card.                                                                                       |
| `highlight`            | `string`    | null           | Displays a colored highlight. If specified (default is no highlight), can be one of `info`, `success`, `error`, or `warning`.                        |
