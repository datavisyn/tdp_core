// import {AllDropdownOptions, GenericOption} from '../types/generalTypes';

// export function getDropdownOptions(): AllDropdownOptions {
//     return  {
//         bubble: {
//             name: 'Bubble Size',
//             callback: updateBubbleSize,
//             scale: bubbleScale,
//             currentColumn: bubbleSize ? bubbleSize : null,
//             currentSelected: bubbleSize ? bubbleSize.name : null,
//             options: props.columns.filter((c) => c.type === 'number').map((c) => c.name),
//             type: 'dropdown',
//             active: true
//         },
//         opacity: {
//             name: 'Opacity',
//             callback: updateOpacity,
//             scale: opacityScale,
//             currentColumn: opacity ? opacity : null,
//             currentSelected: opacity ? opacity.name : null,

//             options: props.columns.filter((c) => c.type === 'number').map((c) => c.name),
//             type: 'dropdown',
//             active: true
//         },
//         color: {
//             name: 'Color',
//             callback: updateColor,
//             scale: colorScale,
//             currentColumn: colorMapping ? colorMapping : null,
//             currentSelected: colorMapping ? colorMapping.name : null,

//             options: props.columns.filter((c) => c.type === 'categorical').map((c) => c.name),
//             type: 'dropdown',
//             active: true
//         },
//         shape: {
//             name: 'Shape',
//             callback: updateShape,
//             scale: shapeScale,
//             currentColumn: shape ? shape : null,
//             currentSelected: shape ? shape.name : null,

//             options: props.columns.filter((c) => c.type === 'categorical').map((c) => c.name),
//             type: 'dropdown',
//             active: true
//         },
//         groupBy: {
//             name: 'Group',
//             callback: updateBarGroup,
//             scale: null,
//             currentColumn: barGroup ? barGroup : null,
//             currentSelected: barGroup ? barGroup.name : null,

//             options: props.columns.filter((c) => c.type === 'categorical').map((c) => c.name),
//             type: 'dropdown',
//             active: true
//         },
//         barMultiplesBy: {
//             name: 'Small Multiples',
//             callback: updateBarMultiples,
//             scale: null,
//             currentColumn: barMultiples ? barMultiples : null,
//             currentSelected: barMultiples ? barMultiples.name : null,

//             options: props.columns.filter((c) => c.type === 'categorical').map((c) => c.name),
//             type: 'dropdown',
//             active: true
//         },
//         filter: {
//             name: 'Filter',
//             callback: props.filterCallback,
//             scale: null,
//             currentColumn: null,
//             currentSelected: '',

//             options: ['Filter In', 'Filter Out', 'Clear'],
//             type: 'button',
//             active: true
//         },
//         barDirection: {
//             name: 'Bar Direction',
//             callback: updateBarDirection,
//             scale: null,
//             currentColumn: null,
//             currentSelected: barDirection,
//             options: ['Vertical', 'Horizontal'],
//             type: 'button',
//             active: true
//         },
//         barGroupType: {
//             name: 'Bar Group By',
//             callback: updateBarGroupType,
//             scale: null,
//             currentColumn: null,
//             currentSelected: barGroupType,

//             options: ['Stacked', 'Grouped'],
//             type: 'button',
//             active: barGroup !== null
//         },
//         barNormalized: {
//             name: 'Bar Normalized',
//             callback: updateBarNormalized,
//             scale: null,
//             currentColumn: null,
//             currentSelected: barNormalized,

//             options: ['Default', 'Normalized'],
//             type: 'button',
//             active: barGroup !== null
//         }
//     };

// }
