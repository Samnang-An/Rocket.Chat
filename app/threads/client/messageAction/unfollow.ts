import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import toastr from 'toastr';

import { Messages } from '../../../models/client';
import { settings } from '../../../settings/client';
import { MessageAction, call } from '../../../ui-utils/client';
import { messageArgs } from '../../../ui-utils/client/lib/messageArgs';

Meteor.startup(function() {
	Tracker.autorun(() => {
		if (!settings.get('Threads_enabled')) {
			return MessageAction.removeButton('unfollow-message');
		}
		MessageAction.addButton({
			id: 'unfollow-message',
			icon: 'bell-off',
			label: 'Unfollow_message',
			context: ['message', 'message-mobile', 'threads'],
			async action(_, props) {
				const { message = messageArgs(this).msg } = props;
				call('unfollowMessage', { mid: message._id }).then(() =>
					toastr.success(TAPi18n.__('You_unfollowed_this_message')),
				);
			},
			condition({ message: { _id, tmid, replies = [] }, user, context }) {
				if (tmid || context) {
					const parentMessage = Messages.findOne({ _id: tmid || _id }, { fields: { replies: 1 } });
					if (parentMessage) {
						replies = parentMessage.replies || [];
					}
				}
				return replies.includes(user._id);
			},
			order: 2,
			group: 'menu',
		});
	});
});
