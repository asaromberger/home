# README

This is a personal financial application.
It handles itemized expenses and investments.

= Itemized Expenses

This function tracks all transactions.
Each transaction is categorized up to three levels plus a tax category.
The menus are:
- Display items for a year
- Roll up categories for a year on a monthly basis
- Roll up categories for multiple years on a yearly basis
- If you have a 'rental' type, display the rental costs
- Display rolled up tax categories for a year
--
- Track transfers between accounts
--
Manage the categorization
Manage the item to categorization map
Manage the account map (see Bulk Input below)
Manage Bulk Input item to item map (see Bulk Input below)
--
Bulk input from file
	You can use either a flat file created yourself or a Quicken-style file
	to do bulk input rather than entering each item separately.
	It will process the file, eliminating anything that has already been
	entered, and present a page for you to:
	- Map what is in the input file to some item title that you recognize
		- This is useful for input from a Quicken-style file
	- Categorize the item
	It will do the best it can, based on previous history, to pre-categorize
	items so that you only have to approve them

= Investments

This function tracks the running balance in investment-type accounts.
The menus are:
- Open Accounts / Closed Accounts / All Accounts - to display the current
	balance in each account
	Details shows the running balances and allows you to make new entries
- Summary - Allows for rollup of multiple accounts into a single summary
- Rebalance - Is used for calculating the rebalance of investments
--
- Manage Summary Types - maps a summary type to the accounts in the summary
- Manage Rebalance Types - maps accounts for rebalancing
-- Bulk Input From File - allows bulk input from a flat file

= There are several other features
- User menu for changing user name and password and signing out
- Admin menu for managing user accounts and privileges
	This menu also includes the database schema
- Jira menu for managing development tasks
