import select from "../src/index.js";

test("simple select", () => {
    const data = {
        user: {
            name: "John"
        }
    };
    const selector = "user.name";
    const result = select(selector, data);
    expect(result).toEqual("John");
});