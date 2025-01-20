// Static Class Imports
import Game from '../classes/game.class.js';

/**
 * Initializes the utility UI event handlers, which must be loaded first because they are general-use and critical.
 */
export default function initializeUtilityUIEventHandlers()
{
	
	/**
	 * General-purpose and utility UI functions.
	 */
	Game.ui.utilities = { };
	
	
	//#region [Functions]
		
		
		//#region [Renderer]
			
			/**
			 * Initializes the renderer canvas.
			 */
			Game.ui.utilities.initializeRenderer = function initializeRenderer()
			{
				
				// Add the canvas to the renderer element
				$('#renderer').html(Game.renderer.domElement);
				
			}
			
		//#endregion
		
		
		//#region [Mouse/Keyboard Controls]
			
			/**
			 * Prevents the right-click context menu from appearing during a single right-click event.
			 */
			Game.ui.utilities.preventContextMenu = function preventContextMenu()
			{
				
				// Disable right-click menu exactly once
				$(Game.dom_document).one('contextmenu', function(event)
				{
					event.preventDefault();
				});
				
			}
			
			/**
			 * Locks the mouse pointer to the renderer when any UI element's whitespace is clicked. Whitespace is defined as whatever HTML elements are within the element calling this function that do not have the "window_class" CSS class applied to them or their children.
			 *
			 * @param {Event} event The event object passed by the event handler.
			 * @param {Element} element_clicked The element which was clicked and is subsequently calling the event handler.
			 * @param {string} window_class The name of the CSS class applied to HTML elements which, along with their children, will not constitute whitespace.
			 */
			Game.ui.utilities.lockPointerOnWhitespaceClick = function lockPointerOnWhitespaceClick(event, element_clicked, window_class)
			{
				
				// Flag indicating whether or not whitespace was clicked
				let is_whitespace_clicked = true;
				
				// Calculate the offset within the HTML element which was clicked
				const offset = $(element_clicked).offset();
				const relative_x = event.pageX - offset.left;
				const relative_y = event.pageY - offset.top;
				
				// Check if any of the HTML element's children with the specified CSS class applied were clicked...
				$(element_clicked).find(window_class).each(function()
				{
					
					// Calculate the child HTML element's offset
					const child_offset = $(this).offset();
					const child_width = $(this).outerWidth();
					const child_height = $(this).outerHeight();
					
					// Check if any <select> elements are open...
					if ($('select').is(':focus'))
					{
						
						// A <select> element dropdown was clicked or closed
						is_whitespace_clicked = false;
						
						// Exit the function
						return false;
						
					}
					else
					{
					
						// Determine if the child HTML element was clicked...
						if (relative_x >= (child_offset.left - offset.left) && relative_x <= (child_offset.left - offset.left + child_width) && relative_y >= (child_offset.top - offset.top) && relative_y <= (child_offset.top - offset.top + child_height))
						{
							
							// The child HTML was clicked instead of whitespace
							is_whitespace_clicked = false;
							
							// Exit the function
							return false;
							
						}
					
					}
					
				});
				
				// Lock the mouse pointer if whitespace was clicked...
				if (is_whitespace_clicked)
				{
					Game.player.controls.lockPointerLockControls();
				}
				
			}
			
		//#endregion
		
		
		//#region [Tooltips]
			
			/**
			 * Re-initializes all UI bootstrap tooltips.
			 */
			Game.ui.utilities.initializeTooltips = function initializeTooltips()
			{
				
				// Remove all tooltips...
				Game.ui.tooltips.forEach((tooltip, element) => {
					
					// Remove event handlers from the tooltip
					//$(element).off('click', Game.ui.utilities.hideTooltip);
					
					// Remove the tooltip
					tooltip.dispose();
					Game.ui.tooltips.delete(element);
					
				});
				
				// Clear tooltips
				Game.ui.tooltips.clear();
				
				// Re-initialize tooltips...
				$('[data-bs-toggle="tooltip"]').each(function()
				{
					
					// Initialize new tooltip
					let tooltip = new bootstrap.Tooltip($(this));
					
					// Add tooltip to the Map, using the DOM element as the key
					Game.ui.tooltips.set(this, tooltip);
					
					// Hide tooltip on click
					//$(this).on('click', Game.ui.utilities.hideTooltip);
					
				});
				
			}
			
			/**
			 * Hides the tooltip of the element it's been applied to.
			 */
			Game.ui.utilities.hideTooltip = function hideTooltip()
			{
				
				// Hide the tooltip
				let tooltip = Game.ui.tooltips.get(this);
				tooltip.hide();
				
			}
			
		//#endregion
		
		
		//#region [Input Elements]
			
			/**
			 * Returns boolean value indicatiing whether or not any input or textarea in the UI has focus.
			 *
			 * @return {array} Boolean value indicatiing whether any input has focus.
			 */
			Game.ui.utilities.isInputFocused = function isInputFocused()
			{
				return ($(Game.dom_document.activeElement).is('input, textarea') || $(Game.dom_document.activeElement).prop('isContentEditable'));
			}
			
			/**
			 * Prompts an open file dialog showing files of the specified type, and invokes the callback when a file is selected.
			 *
			 * @param {string} filetypes The file extensions of the types of files to be shown in the open file dialog.
			 * @param {Function} callback The callback function to be invoked when a file has been selected.
			 */
			Game.ui.utilities.showOpenFileDialog = function showOpenFileDialog(filetypes, callback)
			{
				
				// Initialize a temporary file input element to trigger an open file dialog
				let file_input = $('<input type="file" accept="' + filetypes + '" style="display:none;">');
				$('body').append(file_input);
				
				// Trigger the open file dialog
				file_input.trigger('click');
				
				// Handle file selection...
				file_input.on('change', function(event)
				{
					
					// Perform the next step using the callback function
					callback(event);
					
					// Remove temporary file input element after selected file is loaded
					file_input.remove();
					file_input.off('change');
					
				});
				
			}
			
		//#endregion
		
		
		//#region [Event Handlers]
			
			/**
			 * Removes all JavaScript and jQuery event handlers from the specified HTML DOM element and all of its child elements.
			 *
			 * @param {string} element The ID of the HTML DOM element.
			 */
			Game.ui.utilities.removeAllEventHandlers = function removeAllEventHandlers(element_id, element = null)
			{
				
				// If an element wasn't passed...
				if (element == null)
				{
					
					// Get the specified HTML DOM element...
					element = document.getElementById(element_id.slice(1));
					
				}
				
				// If the element exists...
				if (element)
				{
					
					// Remove all JavaScript event listeners
					const clone = element.cloneNode(true);
					element.parentNode.replaceChild(clone, element);
					
					// Remove all jQuery event listeners
					if (typeof jQuery !== 'undefined')
					{
						jQuery(clone).off();
						jQuery(clone).find('*').off();
					}
					
				}
				
			}
			
		//#endregion
		
		
		//#region [Colours]
			
			/**
			 * Returns an array of hexidecimal MS Paint colour values.
			 *
			 * @return {array} Array of MS Paint colours.
			 */
			Game.ui.utilities.getMSPaintColours = function getMSPaintColours()
			{
				return ["#000000", "#800000", "#008000", "#000080", "#800080", "#008080", "#808000", "#402000",
						"#808080", "#FF0000", "#00FF00", "#0000FF", "#FF00FF", "#00FFFF", "#FFFF00", "#804000",
						"#C0C0C0", "#FF8080", "#00FF80", "#4080FF", "#FF80FF", "#80FFFF", "#FFFF80", "#FF8000",
						"#FFFFFF", "#FFC0C0", "#C0FFC0", "#C0C0FF", "#FFC0FF", "#C0FFFF", "#FFFFC0", "#FFC080"
				];
			}
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		
		//#region [Window]
			
			/**
			 * Window resize event.
			 */
			window.addEventListener('resize', () => {
				
				// Resize the game
				Game.resize();
				
			});
			
		//#endregion
		
		
		//#region [Input Elements]
		
			/**
			 * Letter input textbox text input event.
			 */
			$('.letter-input').on('input', function()
			{
				
				// Get just the letters from the element
				let value = $(this).val().replace(/[^a-zA-Z]/g, '');
				
				// Set the input to the text value
				$(this).val(value);
				
			});
			
			/**
			 * Number input textbox text input event.
			 */
			$('.number-input').on('input', function()
			{
				
				// Get just the numeric value from the element allowing a single decimal place
				let value = $(this).val().replace(/[^0-9.]/g, '');
				
				// Remove any extra decimal places
				if ((value.match(/\./g) || []).length > 1)
				{
					value = value.replace(/\.$/, '');
				}
				
				// Set the input to the numeric value
				$(this).val(value);
				
			});
			
			/**
			 * Number input textbox text change event.
			 */
			$('.number-input').change(function()
			{
				
				// Get element's value
				let value = $(this).val();
				
				// If value is empty, attempt to set to the default value
				if (value == '' && $(this).is('[default]'))
				{
					value = $(this).attr('default');
				}
				
				// If value is decimal with no numbers, set to zero
				if (value == '.')
				{
					value = '0';
				}
				
				// Set the input to the potentially modified value
				$(this).val(value);
				
			});
			
			/**
			 * Percentage input textbox text input event.
			 */
			$('.percent-input').on('input', function()
			{
				
				// Get the input element
				let input = $(this)[0];
				
				// Get just the numeric value from the element
				let value = $(this).val().replace(/[^\d]/g, '');
				
				// Check the input for a value...
				if (value !== '')
				{
					
					// Add % to end of the input
					$(this).val(value + '%');
					input.setSelectionRange(value.length, value.length);
					
				}
				else
				{
					
					// Clear the input
					$(this).val('');
					
				}
				
			});
			
			/**
			 * Percentage input textbox focus event.
			 */
			$('.percent-input').on('focus', function()
			{
				
				// Remove the % when the input is clicked
				let value = $(this).val().replace('%', '');
				$(this).val(value);
				
			});
			
			/**
			 * Percentage input textbox un-focus event.
			 */
			$('.percent-input').on('blur', function()
			{
				
				// Get just the numeric value from the element
				let value = $(this).val().replace(/[^\d]/g, '');
				
				// Check the input for a value...
				if (value !== '')
				{
					
					// Add the % when the input is un-focused
					$(this).val(value + '%');
					
				}
				
			});
			
			/**
			 * Degree input textbox text input event.
			 */
			$('.degree-input').on('input', function()
			{
				
				// Get the input element
				let input = $(this)[0];
				
				// Get just the numeric value from the element
				let value = $(this).val().replace(/[^\d]/g, '');
				
				// Check the input for a value...
				if (value !== '')
				{
					
					// Add ° to end of the input
					$(this).val(value + '°');
					input.setSelectionRange(value.length, value.length);
					
				}
				else
				{
					
					// Clear the input
					$(this).val('');
					
				}
				
			});
			
			/**
			 * Degree input textbox focus event.
			 */
			$('.degree-input').on('focus', function()
			{
				
				// Remove the ° when the input is clicked
				let value = $(this).val().replace('°', '');
				$(this).val(value);
				
			});
			
			/**
			 * Degree input textbox un-focus event.
			 */
			$('.degree-input').on('blur', function()
			{
				
				// Get just the numeric value from the element
				let value = $(this).val().replace(/[^\d]/g, '');
				
				// Check the input for a value...
				if (value !== '')
				{
					
					// Add the ° when the input is un-focused
					$(this).val(value + '°');
					
				}
				
			});
			
		//#endregion
		
		
	//#endregion
	
}