// Redirect the admin config command to the existing util config implementation.
// This file ensures that the command exports both `data` and an `execute` function
// to satisfy the test suite and avoid duplicate command definitions.
import { data as utilData, execute as utilExecute } from '../util/config.js';

// Re-export the command definition. Discord.js requires a `data` property.
export const data = utilData;

// Wrap the util `execute` function so that it satisfies the expected signature.
export async function execute(interaction, client) {
  return utilExecute(interaction, client);
}