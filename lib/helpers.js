// returns context with user info in it if the user is logged in
async function createUserContext(req) {
    let context = {};

    let userinfo = await req.oidc.fetchUserInfo();
    if (userinfo) {
        context.user = {};
        context.user.first_name = userinfo.FirstName;
        context.user.last_name = userinfo.LastName;
        context.user.id = userinfo.sub;
        context.user.email_address = userinfo.preferred_username;
    }
    return context;
}

module.exports.createUserContext = createUserContext;