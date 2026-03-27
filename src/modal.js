/**
 * Custom modal replacing Bootstrap 3 modals.
 * Provides createModal, showModal, hideModal, isModalShown.
 */

var backdrop = null;
var activeModals = 0;

function createBackdrop() {
	if (backdrop) return backdrop;
	backdrop = document.createElement('div');
	backdrop.className = 'winlet-modal-backdrop';
	document.body.appendChild(backdrop);
	void backdrop.offsetWidth; // force reflow
	backdrop.classList.add('show');
	return backdrop;
}

function removeBackdrop() {
	if (!backdrop) return;
	backdrop.classList.remove('show');
	var bd = backdrop;
	backdrop = null;
	setTimeout(function() {
		if (bd.parentNode) bd.parentNode.removeChild(bd);
	}, 300);
}

export function createModal() {
	var modal = document.createElement('div');
	modal.className = 'winlet-modal';
	modal.setAttribute('tabindex', '-1');
	modal.setAttribute('role', 'dialog');
	modal.setAttribute('aria-hidden', 'true');
	modal.setAttribute('data-winlet-dialog', 'yes');
	modal.innerHTML =
		'<div class="winlet-modal-dialog">' +
			'<div class="winlet-modal-content">' +
				'<div class="winlet-modal-header">' +
					'<h4 class="winlet-modal-title">&nbsp;</h4>' +
					'<button type="button" class="winlet-modal-close" aria-label="Close">' +
						'<span aria-hidden="true">&times;</span>' +
					'</button>' +
				'</div>' +
				'<div class="winlet-modal-body"></div>' +
				'<div class="winlet-modal-footer">&nbsp;</div>' +
			'</div>' +
		'</div>';

	document.body.appendChild(modal);

	modal.querySelector('.winlet-modal-close').addEventListener('click', function() {
		hideModal(modal);
	});

	return modal;
}

export function showModal(modal) {
	activeModals++;
	createBackdrop();
	modal.style.display = 'block';
	modal.setAttribute('aria-hidden', 'false');
	void modal.offsetWidth; // reflow
	modal.classList.add('show');

	// Vertical centering
	var dialog = modal.querySelector('.winlet-modal-dialog');
	var modalOffset = (window.innerHeight - dialog.offsetHeight) / 3;
	if (modalOffset > 0)
		dialog.style.marginTop = modalOffset + 'px';

	modal.dispatchEvent(new CustomEvent('shown.winlet.modal'));
}

export function hideModal(modal, callback) {
	modal.classList.remove('show');
	modal.setAttribute('aria-hidden', 'true');

	setTimeout(function() {
		modal.style.display = 'none';
		activeModals--;
		if (activeModals <= 0) {
			activeModals = 0;
			removeBackdrop();
		}
		modal.dispatchEvent(new CustomEvent('hidden.winlet.modal'));
		if (typeof callback === 'function') callback();
	}, 300);
}

export function isModalShown(modal) {
	return modal.classList.contains('show');
}
