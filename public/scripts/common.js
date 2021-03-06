define(function() {
    var ref = new Firebase("https://scorching-heat-6803.firebaseio.com");
    // if no cookies set and logged in, set cookie
    if (!document.cookie) {
        var authData = ref.getAuth();
        if (authData) {
            document.cookie = "uid="+authData.uid;
            document.cookie = "displayName="+authData.facebook.displayName;
            ref.child("users").child(uid).once('value', function(snapshot) {
                document.cookie = "handle="+snapshot.val().handle;
            });
        }
    }

    var screenHeight = window.height;
    document.querySelector('body').style.backgroundSize= "auto " + screenHeight + "px";

    function loginRedirect() {
        if (!document.cookie) {
            console.log("supposed to redir");
            window.location = "index.html";
        }
    }

    function checkHandle() {
        console.log("called checkHandle");
        ref.child("users").child(getCookies().uid).child("handle").transaction(function(userdata) {
             if (userdata) {
                return userdata;
             } else {
                // null or undefined
                return "";
             }
        }, function(error, committed, snapshot) {
            console.log(error);
            console.log(committed);
            console.log(snapshot.val());
            if (error) {
                window.location = "index.html";
            } else {
                if (snapshot.val() === "") {
                    window.location = "username.html";
                } else {
                    window.location = "feed.html";
                }
            }
        });
    }

    function getCookies() {
        var cookieObject = {};
        console.log(cookieObject);
        var cookieArray = document.cookie.split(";");
        for (var i = 0; i < cookieArray.length; i++) {
            var keyVal = cookieArray[i].split("=");
            if (keyVal) {
                cookieObject[keyVal[0].trim()] = keyVal[1].trim();
            }
        }
        console.log(cookieObject);
        return cookieObject;
        /*
        {
            uid: "123",
            other_cookie: cookie_val
        }
        */
    }

	function checkType(type) {
		for (var key in Alert.TYPES) {
			if (Alert.TYPE[key] === type) {
				return type;
			}
		}
		// throw "Type: " + type + " is invalid!";
	}

	function Alert(obj) {
		this.type = (obj.type);
		this.data = obj.data;
	}

	Alert.TYPES = {
		rreq: "rreq",
		freq: "freq",
	}

	function friendRequestAlert(friendRequest) {
		return new Alert({
			type: Alert.TYPES.freq,
			data: friendRequest
		});
	}

	function recRequestAlert(recRequest) {
		var obj = {
			type: Alert.TYPES.rreq,
			data: recRequest
		};
		return new Alert(obj);
	}

    var common = {
        ref: ref,
        logout: (function logout() {
                    console.log("loggingout");
                    ref.unauth();
                    alert("You are logged out!! going back into the login screen");
                    document.cookie = "uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                    document.cookie = "displayName=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                    document.cookie = "handle=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                    window.location = "index.html";
                }),
        updateRecipients: (function updateRecipients(recipients, userId, user) {
                    console.log(user);  
                    if ($(user).hasClass("active")) {
                        $(user).removeClass("active");
                        $(user).css("color","#ddd");
                        recipients.splice($.inArray(userId, recipients), 1);
                        console.log(recipients);
                    } else {
                        $(user).addClass("active");
                        $(user).css("color","#6b2a5f");
                        recipients.push(userId);
                        console.log(recipients);
                    }
                return recipients;
            }),
        sendRequests: (function sendRequests(uid, recipients, reqMessage) {
			var reqsRef = ref.child('requests');
			$.each(recipients, function(i, val) {
				reqsRef
					.push({
						sender: uid,
						receiver: val,
						message: reqMessage
					});
			});
			var usersRef = ref.child('users');
			$.each(recipients, function(i, recUID) {
				var alert = recRequestAlert({
						uid: uid,
						message: reqMessage
				});
				usersRef.child(recUID).child('alerts').push({
					'time': Firebase.ServerValue.TIMESTAMP,
					'alert': alert,
				});
			});
		}),
		getCookies: getCookies,
        checkHandle: checkHandle,
        loginRedirect: loginRedirect,
    }
    return common;
});
