module portfolio::portfolio {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::String;

    struct Portfolio has key, store {
        id: UID,
        name: String,
        course: String,
        school: String,
        about: String,
        linkedin_url: String,
        github_url: String,
        skills: vector<String>,
        // profile_photo_object_id field removed
    }

    public fun create_portfolio(
        sender: address,
        name: String,
        course: String,
        school: String,
        about: String,
        linkedin_url: String,
        github_url: String,
        skills: vector<String>,
        // profile_photo_object_id parameter removed
        ctx: &mut TxContext
    ) {
        let portfolio = Portfolio {
            id: object::new(ctx),
            name,
            course,
            school,
            about,
            linkedin_url,
            github_url,
            skills,
            // profile_photo_object_id field removed
        };
        transfer::transfer(portfolio, sender);
    }

    // Removed update_profile_photo function since there's no profile photo field anymore
}