//On click, clear articles from db, refresh page
$('.emptybtn').on('click', function () {
    $.get(`/clearAll`, res => {
        location.reload();
    });
});
//On click, scape articles to db, refresh page
$('.scrapebtn').on('click', function () {
    $.get(`/scrape`, res => {
        location.reload();
    });
});
