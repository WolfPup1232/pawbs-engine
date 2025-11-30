// Static Class Imports
import Game from '../classes/game.class.js';

/**
 * Initializes the Dialog Box UI event handlers.
 */
export default function initializeDialogBoxUIEventHandlers()
{
	
	/**
	 * Dialog box UI functions.
	 */
	Game.ui.dialog = { };
	
	
	//#region [Functions]
		
		
		//#region [Dialog Box]
			
			/**
			 * Shows a customizable dialog box with an optional cancel button, input field, and background darkening.
			 * 
			 * @param {Object} options - Dialog box configuration options object.
			 * 
			 * @param {string} options.message - The message text to display.
			 * @param {string} [options.message_css] - Custom CSS class for the message text.
			 * 
			 * @param {string} [options.ok_button_text = 'OK'] - OK button text.
			 * @param {string} [options.ok_button_css] - Custom CSS class for the OK button.
			 * @param {Function} [options.ok_button_callback] - Callback function when the OK button is clicked.
			 * 
			 * @param {boolean} [options.show_cancel_button = false] - Flag indicating whether to show the Cancel button.
			 * @param {string} [options.cancel_button_text = 'Cancel'] - Cancel button text.
			 * @param {string} [options.cancel_button_css] - Custom CSS class for the Cancel button.
			 * @param {Function} [options.cancel_button_callback] - Callback function when the Cancel button is clicked.
			 * 
			 * @param {boolean} [options.show_input = false] - Flag indicating whether to show the input field.
			 * @param {string} [options.input_initial = ''] - Initial value of the input field.
			 * @param {string} [options.input_placeholder = ''] - Placeholder text for the input field.
			 * @param {string} [options.input_css] - Custom CSS class for the input field.
			 * 
			 * @param {boolean} [options.show_dark_background = true] - Flag indicating whether to darken the background behind the dialog box.
			 */
			Game.ui.dialog.showDialog = function showDialog(options)
			{
				
				// Set default dialog box configuration object values...
				const config = {
					message: options.message || '',
					message_css: options.message_css || '',
					ok_button_text: options.ok_button_text || 'OK',
					ok_button_css: options.ok_button_css || '',
					ok_button_callback: options.ok_button_callback || null,
					show_cancel_button: options.show_cancel_button || false,
					cancel_button_text: options.cancel_button_text || 'Cancel',
					cancel_button_css: options.cancel_button_css || '',
					cancel_button_callback: options.cancel_button_callback || null,
					show_input: options.show_input || false,
					input_initial: options.input_initial || '',
					input_placeholder: options.input_placeholder || '',
					input_css: options.input_css || '',
					show_dark_background: options.show_dark_background !== false
				};
				
				// Store callbacks for event handlers
				Game.ui.dialog.ok_button_callback = config.ok_button_callback;
				Game.ui.dialog.cancel_button_callback = config.cancel_button_callback;
				
				// Configure message...
				$('#dialog-box-message').html(config.message);
				$('#dialog-box-message').attr('class', config.message_css || 'mb-4');
				
				// Configure OK button...
				$('#dialog-box-ok').text(config.ok_button_text);
				if (config.ok_button_css)
				{
					$('#dialog-box-ok').attr('class', config.ok_button_css);
				}
				else
				{
					$('#dialog-box-ok').attr('class', 'btn btn-lg btn-secondary shadow w-100 m-0');
				}
				
				// Configure Cancel button...
				if (config.show_cancel_button)
				{
					$('#dialog-box-cancel').text(config.cancel_button_text);
					
					if (config.cancel_button_css)
					{
						$('#dialog-box-cancel').attr('class', config.cancel_button_css);
					}
					else
					{
						$('#dialog-box-cancel').attr('class', 'btn btn-lg btn-secondary shadow w-100 m-0');
					}
					
					$('#dialog-box-cancel-container').show();
				}
				else
				{
					$('#dialog-box-cancel-container').hide();
				}
				
				// Configure input field...
				if (config.show_input)
				{
					$('#dialog-box-input').val(config.input_initial);
					$('#dialog-box-input').attr('placeholder', config.input_placeholder);
					
					if (config.input_css)
					{
						$('#dialog-box-input').attr('class', config.input_css);
					}
					else
					{
						$('#dialog-box-input').attr('class', 'form-control mb-3 w-100');
					}
					
					$('#dialog-box-input-container').addClass('d-flex').show();
				}
				else
				{
					$('#dialog-box-input-container').removeClass('d-flex').hide();
				}
				
				// Configure modal background...
				if (config.show_dark_background)
				{
					$('#dialog-box').addClass('dialog-box-darken');
				}
				else
				{
					$('#dialog-box').removeClass('dialog-box-darken');
				}
				
				// Show dialog box
				$('#dialog-box').fadeIn(256);
				
			}
			
			/**
			 * Hides the dialog box.
			 */
			Game.ui.dialog.hideDialog = function hideDialog()
			{
				
				// Hide dialog box
				$('#dialog-box').fadeOut(256);
				
			}
			
			/**
			 * Gets the current input value from the dialog box's input field.
			 * @returns {string} Returns the dialog box's input field value.
			 */
			Game.ui.dialog.getInputValue = function getInputValue()
			{
				return $('#dialog-box-input').val();
			}
			
			/**
			 * Returns a value indicating whether or not the dialog box is currently visible.
			 * @returns {boolean} Returns true if the dialog box is visible.
			 */
			Game.ui.dialog.isVisible = function isVisible()
			{
				return $('#dialog-box').is(':visible');
			}
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		
		//#region [Dialog Box]
			
			/**
			 * OK button click event.
			 */
			$('#dialog-box-ok').on('click', function()
			{
				
				// Get OK button callback function
				const callback = Game.ui.dialog.ok_button_callback;
				
				// Hide dialog box
				Game.ui.dialog.hideDialog();
				
				// Invoke callback function...
				if (callback)
				{
					callback(Game.ui.dialog.getInputValue());
				}
				
			});
			
			/**
			 * Cancel button click event.
			 */
			$('#dialog-box-cancel').on('click', function()
			{
				
				// Get Cancel button callback function
				const callback = Game.ui.dialog.cancel_button_callback;
				
				// Hide dialog box
				Game.ui.dialog.hideDialog();
				
				// Invoke callback function...
				if (callback)
				{
					callback();
				}
				
			});
			
		//#endregion
		
		
	//#endregion
	
}