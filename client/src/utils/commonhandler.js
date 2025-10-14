export const CommonStateHandler = (stateObject, setStateFunction, eventObject) => {
    const { name, value } = eventObject.target;

    setStateFunction((currentState) => {
        // Create a copy of the current state to avoid mutation
        const newState = { ...currentState };

        // Split the name into keys (supports dot notation for nested fields)
        const keys = name.split(".");

        // Use a temporary variable to traverse the object
        let temp = newState;

        // Traverse to the last key in the path, creating nested objects/arrays as needed
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];

            // If the next key in the path is a number, initialize as array if undefined
            if (!temp[key]) {
                temp[key] = isNaN(keys[i + 1]) ? {} : [];
            }

            temp = temp[key]; // Move the pointer deeper into the object
        }

        // Update the final key's value
        temp[keys[keys.length - 1]] = value;

        return newState; // Return the updated state object
    });
};