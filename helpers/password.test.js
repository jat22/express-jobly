const { generatePassword, randomIndex } = require("./password");

describe("randomIndex", function(){
	test("generates random index", () => {
		const result = randomIndex(10);
		expect(typeof result).toBe('number')
		expect(result >= 0).toBe(true);
		expect(result < 10).toBe(true)
	})
})

describe("generatePassword", function(){
	test("generates password", () => {
		const result = generatePassword(10);
		expect(result.length).toBe(10);
		expect(typeof result).toBe('string')
	})
})