
/**Generate a password
 *  <desired password length> => <password>
 * 
 * Generate a password with randomly picked characters
 * characters include uppercase and lowercase letters, numbers and special characters
 * 
 * 
 */

function generatePassword(len){
	const alphaCharLower = "abcdefghijklmnopqrstuvwxyz";
	const alphaCharUpper = "ABCDEFGHIJKLMNOPQRSTUVWYXZ";
	const numericChar = "1234567890";
	const specChar = "!@#$%^&*";
	const charSets = [alphaCharLower, alphaCharUpper, numericChar, specChar];

	let charList = [];

	for(let i = 0; i < len; i++){
		const charSet = charSets[randomIndex(charSets.length)];
		const char = charSet[randomIndex(charSet.length)];
		charList.push(char)
	}

	const password = charList.join('');
	return password
}

function randomIndex(len){
	const result = Math.floor(Math.random() * len)
	return result
}

module.exports = { generatePassword, randomIndex }