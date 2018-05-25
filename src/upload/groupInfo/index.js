/* @flow */
export type Options = {
  publicKey?: string,
}

/**
 * Getting file group info.
 * @param {string} groupId Look like UUID~N, where N stands for a number of files in a group
 * @param {Options} options Set of options.
 * @returns {Promise}
 */
const groupInfo = (groupId: string, options: Options) => new Promise()

export default groupInfo
