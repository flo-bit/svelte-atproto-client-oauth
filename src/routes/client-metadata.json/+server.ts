import { metadata } from '$lib/client-metadata';
import { json } from '@sveltejs/kit';

export async function GET() {
	return json(metadata);
}
