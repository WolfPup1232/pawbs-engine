// Utility UI Event Handlers
export default function initializeUtilityUIEventHandlers()
{
	
	//#region [Input Type Textbox]
	
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
	
}