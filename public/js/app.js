$('.emptybtn').on('click', function () {
    $.get(`/clearAll`, res => {
        location.reload();
    });
});

$('.scrapebtn').on('click', function () {
    $.get(`/scrape`, res => {
        location.reload();
    });
});

$('.readbtn').on('click', function () {
    $.get(`/scrape`, res => {
        location.reload();
    });
});
