let darkmode = false;
let cookiesEnabled = false;

let projectSlideShown = 0;
let projectCount = $(".project").length;

function initCookies() {
	if (typeof localStorage !== 'undefined') {
        localStorage.setItem('feature_test', 'yes');
        if (localStorage.getItem('feature_test') === 'yes') {
            localStorage.removeItem('feature_test');
            cookiesEnabled = true;
        }
	}
}

function loadCookies() {
	if (!cookiesEnabled) return;

	if (localStorage.getItem('darkmode') === 'true')
		toggleDarkMode();
}

function saveCookies() {
	if (!cookiesEnabled) return;

	localStorage.setItem('darkmode', (darkmode ? 'true' : 'false'));
}

$(document).ready(function () {
	initCookies();
	loadCookies();

	$("#card").hide();
	$("#projects").hide();
	$("#footer").hide();
	$("#card").fadeIn(750);
	$("#projects").fadeIn(1500);
	$("#footer").fadeIn(1500);

	$(".closeModal").click(function() {
		let target = $(this).attr("data-target");
		$(target).hide();
	});

	$("#imageCard").on("mouseenter", function() {
		let c = Math.floor(Math.random() * 359);
		$("#characterCard").css("background-color", "hsl(" + c + ",100%," + (40 - Math.random() * 20) +"%)");
	});

	$(".project-link").click(function() {
		let newFolder = $(this).parent().parent().attr("data-folder");
		window.location.href = "../../" + newFolder + "/index.html";
	})

	$(".project-repo").click(function() {
		let newFolder = $(this).parent().parent().attr("data-folder");
		window.location.href = "https://github.com/Rewind1337/rewind1337.github.io/tree/master/" + newFolder + "/";
	})

	let card_fade_out = 400;
	let projects_fade_in = 600;
	let footer_fade_out = 800;
	let footer_fade_in = 1000;

	$(window).scroll(function() {
		let y = window.scrollY;
		if (y < card_fade_out) {
			$("#card").css("opacity", 1);
			$("#footer").css("opacity", 0).css("display", "none");
		}
		else if (y > card_fade_out && y <= projects_fade_in) {
			let o = 1 - ((y - card_fade_out) / 200);
			$("#card").css("opacity", o).css("display", "block");
		}
		else if (y > projects_fade_in && y <= footer_fade_out) {}
		else if (y > footer_fade_out && y <= footer_fade_in) {
			let o = 1 - ((y - footer_fade_out) / 200);
			$("#card").css("opacity", 0).css("display", "none");
			$("#footer").css("opacity", 1 - o).css("display", "block");
		}
		else if (y > footer_fade_in) {
			$("#footer").css("opacity", 1);
		}
	});

	$("#slideLeft").click(function() {
		if (projectSlideShown == 0)
			projectSlideShown = projectCount - 1;
		else
			projectSlideShown -= 1;

		$(".project").hide();
		$(".project[data-id=\"" + projectSlideShown + "\"").fadeIn(200);
	});

	$("#slideRight").click(function() {
		if (projectSlideShown == projectCount - 1)
			projectSlideShown = 0;
		else
			projectSlideShown += 1;

		$(".project").hide();
		$(".project[data-id=\"" + projectSlideShown + "\"").fadeIn(200);
	});

	$("#darkModeBtn").click(toggleDarkMode);

	$("#bookmarkBtn").click(favorite);
	$("#shareBtn").click(share);
	$("#languageBtn").click(openLanguageSelect);
	$("#reportABugBtn").click(openBugReport);
	$("#sendBugReportBtn").click(sendBugReport);
	$("#changeLanguageBtn").click(changeLanguage);

	$("#languageSelect").change(function() {
		if ($(this).val() == "en") {
			window.location.href = "../en/index.html";
		}
		if ($(this).val() == "de") {
			window.location.href = "../de/index.html";
		}
	})
})

function toggleDarkMode() {
	if (!darkmode) {
		$(".section").addClass("darkmode");
		$(".large-icon").addClass("darkmode");
		$(".flip-card-img").addClass("darkmode");
		$(".project-img").addClass("darkmode");
		darkmode = true;
	} else {
		$(".section").removeClass("darkmode");
		$(".large-icon").removeClass("darkmode");
		$(".flip-card-img").removeClass("darkmode");
		$(".project-img").removeClass("darkmode");
		darkmode = false;
	}
	saveCookies();
}

function share(a) {
	var copyText = document.getElementById("shareText");
	copyText.select();
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy");
	alert('Text and Link copied to clipboard');
}

function favorite() {
	alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Cmd' : 'Ctrl') + '+D to bookmark this page.');
}

function openLanguageSelect() {
	$("#languageSelectModal").fadeIn(333);
}

function changeLanguage() {
	$("#languageSelectModal").hide();
}

function openBugReport() {
	$("#bugReportModal").fadeIn(333);
}

function sendBugReport() {
	let subject = "Rewind1337.github.io Bug Report";
	let message = $("#bugReportMessage").val();
	window.location.href = "mailto:rewind1337@hotmail.com?subject=" + subject + "&body=" + message;
	$("#bugReportModal").hide();
}