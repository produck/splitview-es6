import { Container } from './Container';

interface ContainerConstructor {
	new(): Container;
}

export const Container: ContainerConstructor;