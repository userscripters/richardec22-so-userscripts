// ==UserScript==
// @name         Show Remaining Votes
// @description  Show remaining votes and total votes for the day in the top bar.
// @version      0.1
//
// @author       richardec (https://stackoverflow.com/users/17242583)
//
// @include      /^https://(.+\.)?stackoverflow\.com/
// @include      /^https://(.+\.)?stackexchange\.com/
//
// @grant        none
// ==/UserScript==

(async () => {
  const getVotes = async (type) => {
    let votes = 0;

    for (let page = 1; ; page++) {
      const text = await $.get(
        `${location.origin}/users/current?tab=votes&sort=${type}&page=${page}`
      );
      const todaysVotes = text.match(
        new RegExp(
          `<span title="${
            new Date().toISOString().split("T")[0]
          }.+?" class="relativetime">`,
          "g"
        )
      ).length;
      votes += todaysVotes;

      // Currently (see https://meta.stackexchange.com/q/378813/1136431 for changes), at most 30 votes show up on a single page. If it's 30, it's likely that today's votes continue to the next page.
      if (todaysVotes < 30) {
        break;
      }
    }

    return votes;
  };

  const getTotalVotes = async () => {
    const text = await $.get(
      `${location.origin}/users/current?tab=topactivity`
    );
    const votes = await text.match(
      /<div class="fs-body3 fc-dark">\s*(\d+)\s*<\/div>\s*today/
    )[1];
    return Number(votes);
  };

  const e = document.createElement("li");
  e.innerHTML = `<span class="s-topbar--item">Loading&nbsp;votes...</span>`;
  const topbar = $(".s-topbar--content")[0];
  topbar.insertBefore(e, topbar.children[2]);

  const nonDeletedUpvotes = await getVotes("upvote");
  const nonDeletedDownvotes = await getVotes("downvote");
  const availableVotes = 40 - nonDeletedUpvotes - nonDeletedDownvotes;
  const totalVotes = await getTotalVotes();

  let extraStyles = "";
  if (availableVotes <= 5) extraStyles = `style="color:#f45959"`;
  else if (availableVotes <= 10) extraStyles = `style="color:#ea8329"`;

  e.innerHTML = `<span class="s-topbar--item">&nbsp;<b ${extraStyles}>${availableVotes}</b>&nbsp;left&nbsp;(<b>${totalVotes}</b>&nbsp;total)</span>`;
})();
