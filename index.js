const file_system = require("fs/promises");
const read_line = require("readline/promises");

const rl = read_line.createInterface({
	input: process.stdin,
	output: process.stdout
});

async function handle_input(callback) {
	await callback(await rl.question(""));
	await handle_input(callback);
}

function match_pattern(word, target, pattern) {
	const letters = new Set(word);

	for (let i = 0; i < word.length; i++) {
		if (pattern[i] === "x" && word[i] !== target[i]) return false;
		if (pattern[i] === "_" && (word[i] === target[i] || letters.has(target[i]))) return false;
	}
	return true;
}

function match_pattern_soft(word, target, pattern) {
	const letters = new Set(word);

	for (let i = 0; i < word.length; i++) {
		const character = target[i];

		if (pattern[i] === "x") {
			if (word[i] === character) continue;
			const section = target.slice(0, i);
			if (section.includes(character) && new Set(section.matchAll(character)).size >= new Set(word.matchAll(character)).size) return false;
			if (!letters.has(character)) return false;
		}
		if (pattern[i] === "_" && letters.has(character)) return false;
	}
	return true;
}

async function main() {
	const words_list = await file_system.readFile("./words.csv", "utf-8");
	const dictionary = words_list.trim().toLowerCase().split("\n");

	function word_search(target) {
		const patterns = ["__xxx", "xxx_x", "x___x", "xxx_x", "x_x__", "xxx__"];
		const found = [];

		let index = 0;
		for (const pattern of patterns) {
			let matches = dictionary.filter(word => match_pattern(target, word, pattern));

			if (matches.length === 0) {
				matches = dictionary.filter(word => match_pattern_soft(target, word, pattern));
			}

			found[index] = matches;
			index++;
		}

		return found;
	}

	await handle_input(async input => {
		const words = word_search(input);

		console.log(
			//words,
			"\n",
			words.map((word, index) => `${index}: ${word.slice(0, 5).join(", ")}`)
		);
	});
}

main();
