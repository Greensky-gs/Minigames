import { AutocompleteListener } from 'amethystjs';

export default new AutocompleteListener({
    commandName: [{ commandName: 'démineur', optionName: 'taille' }],
    listenerName: 'grid size',
    run: ({ focusedValue }) => {
        const defaultReturn = [
            { name: '5x5', value: 5 },
            { name: '8x8', value: 8 },
            { name: '10x10', value: 10 },
            { name: '12x12', value: 12 }
        ];
        if (!focusedValue) return defaultReturn;
        const int = parseInt(focusedValue);

        if (!int || int < 2) return defaultReturn;
        const num = Math.abs(int);

        return [num - 1, num, num + 1].map((x) => ({ name: `${x}x${x}`, value: x }));
    }
});
