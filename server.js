// Get User Tweet timeline by user ID
// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/quick-start
var http = require('http');

const needle = require("needle");
const express = require("express");
const cors = require('cors')
const api_key = "2e60b5c63eb37f3d1e6143be7d6c3eb6"
const app = express();
app.use(cors())
// this is the ID for @TwitterDev
const userId = "34713362";
const url = `https://api.twitter.com/2/users/${userId}/tweets`;

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const bearerToken = process.env.BEARER_TOKEN;

const getUserTweets = async () => {
	let userTweets = [];

	// we request the author_id expansion so that we can print out the user name later
	let params = {
		"max_results": 10,
		"tweet.fields": "created_at",
		"expansions": "author_id"
	}

	const options = {
		headers: {
			"User-Agent": "v2UserTweetsJS",
			"authorization": "Bearer AAAAAAAAAAAAAAAAAAAAACphWQEAAAAARO%2F4tVH1v0qvNd%2FvnVzhgupr3FI%3Dzn7xz2Oq7vBf5zjfz3gbGei2Hy01P4XuQLRFK3LoqmU0AVU8Bv"
		}
	}

	let hasNextPage = true;
	let nextToken = null;
	let userName;
	console.log("Retrieving Tweets...");


	let resp = await getPage(params, options, nextToken);
	if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
		userName = resp.includes.users[0].username;
		if (resp.data) {
			userTweets.push.apply(userTweets, resp.data);
		}
		if (resp.meta.next_token) {
			nextToken = resp.meta.next_token;
		} else {
			hasNextPage = false;
		}
	} else {
		hasNextPage = false;
	}
	return userTweets;


}

const getPage = async (params, options, nextToken) => {
	if (nextToken) {
		params.pagination_token = nextToken;
	}

	try {
		const resp = await needle('get', url, params, options);

		if (resp.statusCode != 200) {
			//console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
			return;
		}
		return resp.body;
	} catch (err) {
		throw new Error(`Request failed: ${err}`);
	}
}

app.get("/:key", async (req, res) => {
	if (req.params.key == api_key) {
		const result = await getUserTweets();
		res.send(result)
	} else {
		res.send('Error: Wrong API key');
	}

});
app.listen(3000);